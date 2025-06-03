import { toast } from "sonner";

// Toast utility functions
export const showToast = {
  success: (message: string) => {
    toast.success(message);
  },
  error: (message: string) => {
    toast.error(message);
  },
  info: (message: string) => {
    toast.message(message);
  },
  warning: (message: string) => {
    toast.warning(message);
  },
};

// No need for ToastProvider since it's already in the root layout
export const ToastProvider = () => null;

export default showToast;
