import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "./ui/label";
import { Input } from "@base-ui/react/input";
import { Button } from "@base-ui/react/button";
import React, { useState } from "react";
import axios, { isAxiosError } from "axios";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

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
      const { data } = await axios.post("/api/user/sign-up", formData);
      console.log("success", data);
      toast.success("Registration Successfuly! 🎉");
      setIsLoading(false);
      navigate("/login")
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
          <CardTitle>Registration From</CardTitle>
          <CardDescription>Resgiter Yout Info</CardDescription>
          <CardAction>Sign Up</CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">User</Label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter Your Name"
                  required
                  onChange={handleInputChange}
                />
              </div>
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
            <div>
              <Button
                type="submit"
                className="w-full bg-slate-900 text-slate-50 h-ma"
              >
                {isLoading ? "Registering.." : "Sign-Up"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
