"use client";
import { isMobile } from "mobile-device-detect";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import React from "react";
import { PlusIcon } from "./PlusButton";

const AddExpenseButton = () => {
  const [render, setRender] = useState(false);

  useEffect(() => {
    setRender(true);
  }, []);

  if (!render) return null;

  return isMobile ? (
    <Button variant="outline" className="">
      <PlusIcon className="w-4 h-4" />
    </Button>
  ) : (
    <Button variant="outline" className="">
      Add new expense
    </Button>
  );
};
export default AddExpenseButton;
