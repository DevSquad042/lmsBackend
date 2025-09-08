import Flutterwave from "flutterwave-node-v3";

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,   // from Flutterwave dashboard
  process.env.FLW_SECRET_KEY
);

export default flw;
