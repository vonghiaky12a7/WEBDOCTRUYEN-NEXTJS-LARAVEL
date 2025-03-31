import { Link, Button } from "@heroui/react";
export default function ButtonLink({ title = "Sign in" }) {
  return (
    <Button
      as={Link}
      color="primary"
      className="bg-primary-500 hover:bg-primary-600 text-white"
      href="/auth/signin"
      variant="solid"
    >
      {title}
    </Button>
  );
}
