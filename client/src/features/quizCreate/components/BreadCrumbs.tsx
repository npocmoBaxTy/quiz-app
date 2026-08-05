import { NavLink } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/components/ui/breadcrumb";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

export function QuizBreadCrumbs() {
  const { watch } = useFormContext()
  const { t } = useTranslation();
  return (
    <Breadcrumb>
      <BreadcrumbList className="text-xs flex items-center">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <NavLink to="/">{t("quizBuilder.home")}</NavLink>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="text-(--success-green)">
            {watch("title")}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
