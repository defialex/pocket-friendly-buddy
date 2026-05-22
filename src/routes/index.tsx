import { Navigate, createFileRoute } from "@tanstack/react-router";
import { useCurrentBoardId } from "@/lib/budget-store";

export const Route = createFileRoute("/")({
  component: HomeRedirect,
});

function HomeRedirect() {
  const currentBoardId = useCurrentBoardId();

  if (currentBoardId) {
    return <Navigate to="/board/$boardId" params={{ boardId: currentBoardId }} />;
  }

  return <Navigate to="/boards" />;
}
