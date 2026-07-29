interface DialogProps {
  visible: boolean;
  children: React.ReactNode;
  onClose?: () => void;
}

export const Dialog = ({ visible, children }: DialogProps) => {
  return (
    <div
      className={`fixed inset-0 z-100 items-center justify-center bg-black/60 backdrop-blur-md ${visible ? "flex" : "hidden"}`}
    >
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md text-center">
        {children}
      </div>
    </div>
  );
};
