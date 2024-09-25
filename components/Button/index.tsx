import styled from "styled-components";
import { useEffect } from "react";

const GradientCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  --gradient-color-1: #161f27;
  --gradient-color-2: #050505;
  --gradient-color-3: #3804f6;
  --gradient-color-4: #2fbc73;
  z-index: -1;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 1000px;
`;

const StyledButton = styled.button`
  transition: all 0.1s ease-out;

  .bruh {
    width: 100%;
    height: 100%;
    border-radius: 1000px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  :hover {
    filter: drop-shadow(0px 5px 5px #000);
  }

  :disabled {
    filter: none !important;
    cursor: default;

    .bruh {
      background: rgb(156, 163, 175);
    }
  }
`;

function Button({ children, ...props }: any) {
  useEffect(() => {
    const gradient = new Gradient();

    // @ts-ignore
    gradient.initGradient("#button-gradient");
  }, []);

  return (
    <StyledButton
      {...props}
      className={
        "relative text-white w-72 h-16 rounded-full mt-10 flex items-center justify-center text-xl font-bold"
      }
    >
      <GradientCanvas id={"button-gradient"} />
      <div className={"bruh"}>{children}</div>
    </StyledButton>
  );
}

export default Button;

import { Gradient } from "../Gradient";
