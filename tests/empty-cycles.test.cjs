const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test, beforeEach, afterEach, mock } = require("node:test");
const ts = require("typescript");
const React = require("react");
const { act, create } = require("react-test-renderer");

// Exercise the real dashboard, context, and creation form. Replace browser UI
// primitives and server actions so these tests need neither Clerk nor a database.
const rootDir = path.resolve(__dirname, "..");
const modules = new Map();
const hotkeys = new Map();
const actions = {
  usersActions: {
    createUser: mock.fn(async () => [{ id: "test-user", name: "Test" }]),
    updateUser: mock.fn(),
    getDefaultCategories: mock.fn(),
    updateUserLastCreatedCategoriesJson: mock.fn(),
  },
  cyclesActions: { createCycle: mock.fn(), deleteCycle: mock.fn() },
};
const toast = { success: mock.fn(), error: mock.fn() };
const primitives = new Map();
const ui = (name) => {
  if (!primitives.has(name)) {
    primitives.set(
      name,
      React.forwardRef(({ children, ...props }, ref) =>
        React.createElement(name, { ...props, ref }, children),
      ),
    );
  }
  return primitives.get(name);
};
const mocks = {
  "@/app/actions": actions,
  "./actions": actions,
  "./actions/users": { getUserWithCycle: mock.fn() },
  "@clerk/nextjs/server": {
    currentUser: async () => ({ id: "test-user", fullName: "Test" }),
  },
  "@/components/common/SWRprovider": { SWRProvider: ui("swr-provider") },
  sonner: { toast },
  "lodash.debounce": (callback) => callback,
  "react-hotkeys-hook": {
    useHotkeys: (keys, callback) => {
      React.useEffect(() => {
        hotkeys.set(keys[0], callback);
        return () => hotkeys.delete(keys[0]);
      });
    },
  },
  "@/components/common/BurgerMenu": { BurgerMenu: ui("menu") },
  "@/components/modals/AddNewExpense/AddNewExpense": {
    default: ui("expense-modal"),
  },
  "@/components/modals/MoveBudget/MoveBudget": {
    default: ui("move-budget-modal"),
  },
  "@/components/common/TwoDatesPicker": { default: ui("date-picker") },
  "@/lib/utils": { createWeeksArray: () => [{}] },
};

function load(file) {
  const absolute = path.resolve(rootDir, file);
  if (modules.has(absolute)) return modules.get(absolute).exports;
  const module = { exports: {} };
  modules.set(absolute, module);
  const code = ts.transpileModule(fs.readFileSync(absolute, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const localRequire = (id) => {
    if (id in mocks) {
      const value = mocks[id];
      return value.default ? { __esModule: true, ...value } : value;
    }
    if (id === "@/components/ui/form") {
      return { FormField: require("react-hook-form").Controller };
    }
    if (id.startsWith("@/components/ui/")) {
      return new Proxy({}, { get: (_, name) => ui(name) });
    }
    if (id === "./Modal") {
      return {
        __esModule: true,
        default: ({ open, children, ...props }) =>
          open ? React.createElement("modal", props, children) : null,
      };
    }
    if (id === "./MonthlyReportForm")
      return { __esModule: true, default: ui("monthly-report") };
    if (id === "../CycleTab")
      return { __esModule: true, default: ui("cycle-content") };
    if (id.startsWith(".") || id.startsWith("@/")) {
      const base = id.startsWith("@/")
        ? path.join(rootDir, id.slice(2))
        : path.resolve(path.dirname(absolute), id);
      const resolved = [
        `${base}.tsx`,
        `${base}.ts`,
        path.join(base, "index.ts"),
      ].find((candidate) => fs.existsSync(candidate));
      assert.ok(resolved, `Cannot resolve ${id}`);
      return load(resolved);
    }
    return require(id);
  };
  new Function("require", "module", "exports", code)(
    localRequire,
    module,
    module.exports,
  );
  return module.exports;
}

const MainTable = load("components/main/MainTable/MainTable.tsx").default;
const Home = load("app/page.tsx").default;
const user = {
  id: "test-user",
  name: "Test",
  lastOpenedCycleId: null,
  lastOpenedSubcycleId: null,
};
const cycle = { id: "first-cycle", title: "First cycle" };
let renderer;

async function render(cycles, overrides = {}) {
  await act(async () => {
    const element = React.createElement(MainTable, {
      cycles,
      user: { ...user, ...overrides },
    });
    if (renderer) renderer.update(element);
    else renderer = create(element);
  });
}
const nodes = (type) => renderer.root.findAllByType(type);
const button = (label) =>
  nodes("Button").find((node) => node.children.includes(label));
const selectedId = () => nodes("Tabs")[0].props.value;

beforeEach(() => {
  for (const group of [actions.usersActions, actions.cyclesActions, toast]) {
    for (const fn of Object.values(group)) fn.mock.resetCalls();
  }
  actions.usersActions.getDefaultCategories.mock.mockImplementation(
    async () => [{ title: "Food", initialAmount: 100, weekly: true }],
  );
  actions.cyclesActions.createCycle.mock.mockImplementation(async () => ({
    cycleId: cycle.id,
    cycleTotal: 100,
  }));
  actions.cyclesActions.deleteCycle.mock.mockImplementation(async () => {});
});

afterEach(async () => {
  if (renderer) await act(async () => renderer.unmount());
  renderer = undefined;
});

test("new user sees an empty state and can open the creation form", async () => {
  await render([]);
  assert.match(JSON.stringify(renderer.toJSON()), /No cycles yet/);
  assert.ok(button("Create cycle"));
  assert.equal(nodes("expense-modal").length, 0);
  await act(async () => button("Create cycle").props.onClick());
  assert.equal(nodes("modal")[0].props.dialogTitle, "New Cycle");
  assert.equal(actions.usersActions.getDefaultCategories.mock.callCount(), 1);
});

test("empty cycles clear a previously deleted selection and keyboard navigation is safe", async () => {
  await render([], {
    lastOpenedCycleId: "deleted",
    lastOpenedSubcycleId: "deleted-week",
  });
  assert.equal(selectedId(), "");
  await act(async () => {
    for (const callback of hotkeys.values()) callback();
  });
  assert.equal(selectedId(), "");
  assert.ok(button("Create cycle"));
});

test("deleting the final cycle exposes the creation button", async () => {
  await render([cycle]);
  await act(async () => {
    const form = nodes("form").find(
      (node) => typeof node.props.action === "function",
    );
    await form.props.action();
  });
  assert.equal(
    actions.cyclesActions.deleteCycle.mock.calls[0].arguments[0],
    cycle.id,
  );
  await render([]);
  assert.equal(selectedId(), "");
  assert.ok(button("Create cycle"));
  assert.equal(nodes("cycle-content").length, 0);
});

for (const withReport of [false, true]) {
  test(`creating the first cycle selects it and ${withReport ? "preserves the report step" : "closes the dialog"}`, async () => {
    await render([]);
    await act(async () => button("Create cycle").props.onClick());
    if (withReport) {
      await act(async () => nodes("Checkbox")[0].props.onCheckedChange(true));
    }
    // A server action may refresh the cycle list before its promise resolves.
    // The form must retain its state across that refresh.
    actions.cyclesActions.createCycle.mock.mockImplementation(async () => {
      await render([cycle]);
      return { cycleId: cycle.id, cycleTotal: 100 };
    });
    await act(async () => {
      await nodes("form")
        .find((node) => node.props.onSubmit)
        .props.onSubmit({
          preventDefault() {},
          persist() {},
        });
    });
    assert.equal(actions.cyclesActions.createCycle.mock.callCount(), 1);
    assert.equal(selectedId(), cycle.id);
    assert.equal(nodes("cycle-content").length, 1);
    if (withReport) {
      assert.equal(nodes("modal")[0].props.dialogTitle, "Monthly Report");
      assert.equal(nodes("monthly-report")[0].props.cycleId, cycle.id);
      await act(async () => nodes("monthly-report")[0].props.onSkip());
    }
    assert.equal(nodes("modal").length, 0);
  });
}

test("a failed defaults request shows an error and allows retry", async () => {
  actions.usersActions.getDefaultCategories.mock.mockImplementationOnce(
    async () => {
      throw new Error("Unavailable");
    },
  );
  await render([]);
  await act(async () => button("Create cycle").props.onClick());
  assert.equal(toast.error.mock.callCount(), 1);
  assert.equal(button("Create cycle").props.disabled, false);
  await act(async () => button("Create cycle").props.onClick());
  assert.equal(nodes("modal").length, 1);
});

test("populated cycles keep navigation and recover from a stale selection", async () => {
  const second = { id: "second", title: "Second cycle" };
  await render([cycle, second], { lastOpenedCycleId: "deleted" });
  assert.equal(selectedId(), cycle.id);
  assert.equal(button("Create cycle"), undefined);
  await act(async () => hotkeys.get("meta+arrowright")());
  assert.equal(selectedId(), second.id);
  await act(async () => hotkeys.get("meta+arrowleft")());
  assert.equal(selectedId(), cycle.id);
});

test("a newly provisioned account keeps the report dialog through its first page refresh", async () => {
  mocks["./actions/users"].getUserWithCycle.mock.mockImplementation(
    async () => null,
  );
  await act(async () => {
    renderer = create(await Home());
  });
  await act(async () => button("Create cycle").props.onClick());
  await act(async () => nodes("Checkbox")[0].props.onCheckedChange(true));
  actions.cyclesActions.createCycle.mock.mockImplementation(async () => {
    mocks["./actions/users"].getUserWithCycle.mock.mockImplementation(
      async () => ({ ...user, cycles: [cycle] }),
    );
    renderer.update(await Home());
    return { cycleId: cycle.id, cycleTotal: 100 };
  });
  await act(async () => {
    await nodes("form")
      .find((node) => node.props.onSubmit)
      .props.onSubmit({ preventDefault() {}, persist() {} });
  });
  assert.equal(nodes("modal")[0]?.props.dialogTitle, "Monthly Report");
  assert.equal(selectedId(), cycle.id);
});
