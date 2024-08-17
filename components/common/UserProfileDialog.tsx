import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SelectUser } from "@/db/schema";
import { SignOutButton } from "@clerk/nextjs";
export default async function UserProfileDialog({
  user,
}: {
  user: SelectUser;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="btn btn-primary hover:underline">
          Hello, <span className="line-through">{getRandomAdjective()}</span>{" "}
          {user?.name}.
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Want to sign out?</DialogTitle>
        </DialogHeader>
        <SignOutButton />
      </DialogContent>
    </Dialog>
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
