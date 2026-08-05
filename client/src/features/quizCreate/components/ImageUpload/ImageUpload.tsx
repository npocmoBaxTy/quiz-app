import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadQuizImage } from "../../api/uploadImage";
import { resolveMediaUrl } from "@/shared/api/resolveMediaUrl";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

type Props = {
  value?: string;
  onChange: (url: string | undefined) => void;
  size?: "sm" | "md";
};

export const ImageUpload = ({ value, onChange, size = "md" }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const { mutate: upload, isPending } = useMutation({
    mutationFn: uploadQuizImage,
    onSuccess: (url) => onChange(url),
    onError: () => toast.error(t("quizBuilder.imageUpload.uploadFailed")),
  });

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("quizBuilder.imageUpload.selectImageFile"));
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error(t("quizBuilder.imageUpload.maxFileSize"));
      return;
    }
    upload(file);
  };

  const dimension = size === "sm" ? "h-14 w-14" : "h-24 w-24";

  if (value) {
    return (
      <div className={`relative shrink-0 ${dimension}`}>
        <img
          src={resolveMediaUrl(value)}
          alt=""
          className="h-full w-full rounded-lg border border-(--surface-high) object-cover"
        />
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-(--danger-red) text-white shadow-sm"
          title={t("quizBuilder.imageUpload.removeImage")}
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={isPending}
      className={`flex shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-(--surface-high) text-(--text-muted) transition-colors hover:border-(--main-blue) hover:text-(--main-blue) ${dimension}`}
      title={t("quizBuilder.imageUpload.addImage")}
    >
      {isPending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <ImagePlus size={size === "sm" ? 14 : 18} />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </button>
  );
};
