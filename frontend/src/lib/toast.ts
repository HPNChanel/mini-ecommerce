import { toast } from "../components/ui/use-toast";

export function showErrorToast(message: string): void {
  toast({
    title: "Something went wrong",
    description: message,
    variant: "destructive"
  });
}

export function showSuccessToast(message: string, title = "Success"): void {
  toast({
    title,
    description: message
  });
}
