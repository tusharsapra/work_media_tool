import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePlanStore } from "@/store/usePlanStore";

export function ArchiveProjectDialog({
  projectId,
  projectName,
  open,
  onOpenChange,
}: {
  projectId: string | null;
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const archiveProject = usePlanStore((s) => s.archiveProject);

  const handleArchive = () => {
    if (projectId) archiveProject(projectId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archive {projectName || "this project"}?</DialogTitle>
          <DialogDescription>
            This will hide the project from the active project list. Existing plans remain stored
            locally and the project can be restored from the archived filter.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleArchive}>
            Archive project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
