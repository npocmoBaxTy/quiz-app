import { MoveRight } from "lucide-react"
import { C } from "../constants"
import { useTranslation } from "react-i18next"
interface IBtn {
    type?: "button" | "submit",
    clickHandler?: () => void,

}


export const Btn = ({ type = "button", clickHandler }: IBtn) => {
    const { t } = useTranslation()
    return (
        <div className="mt-5">
            <button type={type}
                className="group duration-300 hover:bg-(--main-blue)"
                style={{
                    width: "100%",
                    padding: "12px",
                    background: C.primary,
                    color: "#fff",
                    border: "none",
                    borderRadius: 11,
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    marginTop: 2
                }}
                onClick={clickHandler}
            >
                {t("auth.register.btnFrd")}
                <MoveRight size={17} className="group duration-300 group-hover:translate-x-1" />
            </button>

        </div>
    )
}