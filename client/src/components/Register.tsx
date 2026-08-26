import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "./ui/label";
import { Input } from "@base-ui/react/input";
import { Button } from "@base-ui/react/button";
import { useState } from "react";
import axios from "axios";
import { Link } from "react-router";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleInputChange = (event) => {
    setFormData({
      ...formData,
      [event.target.id]: event.target.value,
    });
  };
  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const { data } = await axios.post(
        "/api/auth/sign-up",
        formData,
      );
      console.log("success", data)
    } catch (err) {
      console.error("there is an error:" + err);
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
                Sign-Up
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
