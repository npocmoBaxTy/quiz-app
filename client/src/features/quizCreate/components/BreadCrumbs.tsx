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

export function QuizBreadCrumbs() {
  const { watch } = useFormContext()
  return (
    <Breadcrumb>
      <BreadcrumbList className="text-xs flex items-center">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <NavLink to="/">Главная</NavLink>
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
