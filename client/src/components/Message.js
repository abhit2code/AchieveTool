import React from "react";

const Message = (props) => {
  console.log(props);
  const msg_cont_sender = {
    display: "flex",
    flexDirection: "column",
    alignItems: "vertical-align",
    marginLeft: "0.7%",
    marginBottom: "7px",
  };

  const msg_text_sender = {
    display: "inline-block",
    fontSize: "21px",
    margin: "0px",
    backgroundColor: "white",
    padding: "10px",
    borderRadius: "0px 10px 10px 10px",
    maxWidth: "70%", // Setting maximum width
    wordWrap: "break-word", // Ensuring long words wrap
  };

  const msg_cont_owner = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    marginRight: "0.7%",
    marginBottom: "10px",
  };

  const msg_text_owner = {
    display: "inline-block",
    fontSize: "21px",
    margin: "0px",
    backgroundColor: "#8da4f1",
    color: "white",
    padding: "10px",
    borderRadius: "10px 0px 10px 10px",
    maxWidth: "70%", // Setting maximum width
    wordWrap: "break-word", // Ensuring long words wrap
  };

  const msg_time = {
    fontSize: "13px",
    color: "gray",
    fontWeight: "300px",
    paddingLeft: "6px",
  };

  console.log(Object.values(props.message)[0][0]);

  return (
    <>
      {Object.values(props.message)[0][2] === "chatting" ? (
        <div style={props.owner ? msg_cont_owner : msg_cont_sender}>
          <p
            className="msg_text"
            style={props.owner ? msg_text_owner : msg_text_sender}
          >
            {Object.values(props.message)[0][0]}
          </p>
          <span className="msg_time" style={msg_time}>
            {Object.values(props.message)[0][1]}
          </span>
        </div>
      ) : (
        <p style={{ color: "black", marginLeft: "33%", fontSize: "120%" }}>
          {Object.values(props.message)[0][0]}
        </p>
      )}
    </>
  );
};

export default Message;
