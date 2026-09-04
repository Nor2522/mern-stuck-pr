import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"
import React, { useEffect, useState } from "react";
import axios, { isAxiosError } from "axios";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import useUser from "@/hooks/useUser";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login, user } = useUser();
 
  useEffect(()=>{
     if(user) navigate("/")
  },[user])
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.id]: event.target.value,
    });
  };
  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setIsLoading(true);
      const { data } = await axios.post("/api/user/login", formData);
      console.log("success", data);
      toast.success("Login Successfuly! 🎉");
      setIsLoading(false);
      // navigate("/dashboard")
      login(data.userData,data.expire)
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        toast.error(errorMessage);
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Login From</CardTitle>
          <CardDescription>Login Yout Info</CardDescription>
          <CardAction>Login</CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  required
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  required
                  placeholder="Enter Your Password"
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="mt-4">
              <Button
                type="submit"
                 className={"w-full"}
              >
                {isLoading ? "Login.." : "Login"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
