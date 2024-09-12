"use client";
import { isMobile } from "mobile-device-detect";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import React from "react";
import { PlusIcon } from "./PlusButton";

const AddExpenseButton = () => {
  return (
    <Button variant="outline" className="">
      Add new expense
    </Button>
  );
};
export default AddExpenseButton;
