import { createPortal } from "react-dom";

const Modal = ({ children }: { children: JSX.Element }): JSX.Element => {
  const modal = (
    <>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vw",
          backgroundColor: "gray",
          opacity: 0.6,
        }}></div>
      <div
        style={{
          position: "absolute",
          margin: "auto",
          textAlign: "center",
          width: "50%",
          backgroundColor: "white",
          padding: "10px",
          border: "1px black solid",
        }}>
        {children}
      </div>
    </>
  );
  return createPortal(modal, document.getElementById("modal")!);
};

export default Modal;
