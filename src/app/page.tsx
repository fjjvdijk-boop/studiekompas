import { statistiek } from "@/lib/statistiek";
import { Home } from "./Home";

export default function Pagina() {
  return <Home stat={statistiek()} />;
}
