import axios from "axios";
import React from "react";
import io from "socket.io-client";

function Token() {
  const baseURL = "http://192.168.0.241:8003";
  const [post, setPost] = React.useState({
    clientType: "",
    macA: "",
  });
  const [token, setToken] = React.useState(null);

  React.useEffect(() => {
    axios.get(`${baseURL}/token`).then((response) => {
      setPost(response.data);
    });
  }, []);

  const changeHandler = (e) => {
    setPost({
      ...post,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    try {
      e.preventDefault();
      let { data } = await axios.post(`${baseURL}/genTok`, post);
      console.log("\nToken generated successfully!\n");
      setToken(data);
      const socket = io.connect("http://192.168.0.241:8003");
      socket.emit("clientAuth", token);

      console.log(socket);
    } catch (err) {
      console.log(err.response.data);
    }
  };
  return (
    <>
      <center>
        <div>
          <h1>Token</h1>
          <form onSubmit={submitHandler}>
            <br />
            <label>
              <b>Enter Your Client Type: </b>
              <input
                type="text"
                name="clientType"
                required
                onChange={changeHandler}
              />
            </label>
            <br /> <br />
            <label>
              <b>Enter Your MAC Address: </b>
              <input
                type="text"
                name="macA"
                required
                onChange={changeHandler}
              />
            </label>
            <br />
            <button value="submit" type="submit">
              Submit
            </button>
          </form>
        </div>
        <div
          style={{
            border: "solid red 2px",
            textAlign: "center",
            margin: "20px",
          }}
        >
          <h3>
            Your API Token is : <br />
            <textarea>{token ? token : ""}</textarea>
          </h3>
        </div>
      </center>
    </>
  );
}

export default Token;
