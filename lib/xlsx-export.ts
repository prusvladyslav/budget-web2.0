import * as XLSX from "xlsx";
import type { ExpenseReportRow } from "@/app/actions/report";

export function exportExpensesToXlsx(
  expenses: ExpenseReportRow[],
  cycleName: string
) {
  // Transform data for Excel
  const data = expenses.map((expense) => ({
    Date: expense.date,
    Amount: expense.amount,
    Category: expense.category,
    Subcycle: expense.subcycle,
    Label: expense.label || "",
    Comment: expense.comment || "",
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 12 }, // Date
    { wch: 10 }, // Amount
    { wch: 20 }, // Category
    { wch: 15 }, // Subcycle
    { wch: 15 }, // Label
    { wch: 30 }, // Comment
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

  // Generate filename with sanitized cycle name
  const sanitizedName = cycleName.replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `expenses_${sanitizedName}.xlsx`;

  // Trigger download
  XLSX.writeFile(workbook, filename);
}

export function exportExpensesGroupedByLabel(
  expenses: ExpenseReportRow[],
  cycleName: string
) {
  // Group expenses by label
  const groupedByLabel = expenses.reduce(
    (acc, expense) => {
      const label = expense.label || "No Label";
      if (!acc[label]) {
        acc[label] = {
          expenses: [],
          total: 0,
        };
      }
      acc[label].expenses.push(expense);
      acc[label].total += expense.amount;
      return acc;
    },
    {} as Record<string, { expenses: ExpenseReportRow[]; total: number }>
  );

  // Create data rows with grouping
  const data: Record<string, string | number>[] = [];

  // Sort labels alphabetically, but keep "No Label" at the end
  const sortedLabels = Object.keys(groupedByLabel).sort((a, b) => {
    if (a === "No Label") return 1;
    if (b === "No Label") return -1;
    return a.localeCompare(b);
  });

  for (const label of sortedLabels) {
    const group = groupedByLabel[label];

    // Add each expense in the group
    for (const expense of group.expenses) {
      data.push({
        Label: label,
        Date: expense.date,
        Amount: expense.amount,
        Category: expense.category,
        Comment: expense.comment || "",
      });
    }

    // Add subtotal row
    data.push({
      Label: `${label} - TOTAL`,
      Date: "",
      Amount: group.total,
      Category: "",
      Comment: "",
    });

    // Add empty row for spacing
    data.push({
      Label: "",
      Date: "",
      Amount: "",
      Category: "",
      Comment: "",
    });
  }

  // Add grand total at the end
  const grandTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  data.push({
    Label: "GRAND TOTAL",
    Date: "",
    Amount: grandTotal,
    Category: "",
    Comment: "",
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 20 }, // Label
    { wch: 12 }, // Date
    { wch: 12 }, // Amount
    { wch: 20 }, // Category
    { wch: 30 }, // Comment
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "By Label");

  // Generate filename
  const sanitizedName = cycleName.replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `expenses_by_label_${sanitizedName}.xlsx`;

  // Trigger download
  XLSX.writeFile(workbook, filename);
}
