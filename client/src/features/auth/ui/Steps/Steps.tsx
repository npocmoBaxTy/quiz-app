import { useFormCtx } from "../../FormContext/userFormContext"
import { StepOne } from "./Step1"
import { Step2 } from "./Step2"
import { StepHeader } from "./StepHeader"

export const Steps = () => {
    const { step } = useFormCtx()
    return (
        <>
            <StepHeader current={step} />
            {
                step == 1 ? <StepOne /> : <Step2 />
            }
        </>
    )
}