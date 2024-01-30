import { Loader2 } from "lucide-react";

const Spinner = () => {
  return (
    <>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    </>
  );
};

export default Spinner;
