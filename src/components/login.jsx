import React from "react";
import { Button, Checkbox, Form, Input } from 'antd';
import axios from "axios";
import Alert from "./alert";
import { getDocs } from "firebase/firestore";
import { signIn } from "../service/auth";
import { getAccountLogin } from "../service/account";
import Swal from 'sweetalert2'

const onFinish = async ({niu, password}) => {
  // const token = await getToken(values)
  const account = await getAccountLogin(niu, password)
  if (account) {    
    const payload = {
      email: account.email,
      password: password
    }
    const token = await signIn(payload)
    console.log(token)
  }
  else Swal.fire({
    position: 'center',
    icon: 'error',
    title: 'Account not found',
    showConfirmButton: false,
    timer: 2000
  })  
};
const onFinishFailed = (errorInfo) => {
  console.log('Failed:', errorInfo);
};

const customConfig = {
  headers: {
  'Content-Type': 'application/json'
  }
};

const getToken = async (payload) => {
  const loginPayload = JSON.stringify(payload)
  console.log(loginPayload)
  await axios.post("http://localhost:3002/auth/login", loginPayload, customConfig)
  .then(response => {
    //get token from response        
    const token  =  response.data["data"].access_token;    
    
    //set JWT token to local
    localStorage.setItem("token", token);

    //set token to axios common header
    console.log(token)

    //redirect user to home page    
    window.location.href = '/dashboard'
  })
  .catch(err => { 
    alert("Wrong credential")
  });
}

const Login = () => {
  return (
    <div className="border rounded-lg border-sky-500 p-10 px-20">
      <Form
        name="basic"
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 16,
        }}
        style={{
          maxWidth: 600,
        }}
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="NIU"
          name="niu"
          rules={[
            {
              required: true,
              message: "Please input your username!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="remember"
          valuePropName="checked"
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          <Checkbox>Remember me</Checkbox>
        </Form.Item>

        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          <Button type="primary" style={{ background: "red", borderColor: "yellow" }} htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
