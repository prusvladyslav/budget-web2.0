import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SelectUser } from "@/db/schema";
import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import GeneralLink from "./GeneralLink";
export default async function UserProfileDialog({
  user,
}: {
  user: SelectUser;
}) {
  return (
    <div className="flex justify-between">
      <Dialog>
        <DialogTrigger>
          <span className="hover:underline">
            Hello, <span className="line-through">{getRandomAdjective()}</span>{" "}
            {user?.name}.
          </span>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Want to sign out?</DialogTitle>
          </DialogHeader>
          <SignOutButton />
        </DialogContent>
      </Dialog>
      <GeneralLink href={"/expenses"}>Expenses History</GeneralLink>
    </div>
  );
}

function getRandomAdjective() {
  const adjectives = [
    "strange",
    "beautiful",
    "handsome",
    "weird",
    "charming",
    "brilliant",
    "graceful",
    "mysterious",
    "elegant",
    "bold",
    "quirky",
    "dazzling",
    "curious",
    "thoughtful",
    "adventurous",
    "playful",
    "eccentric",
    "radiant",
    "fearless",
    "majestic",
    "whimsical",
    "serene",
    "witty",
    "vibrant",
    "mischievous",
    "enigmatic",
    "captivating",
    "melancholic",
    "vivacious",
    "charming",
  ];

  const randomIndex = Math.floor(Math.random() * adjectives.length);
  return adjectives[randomIndex];
}
