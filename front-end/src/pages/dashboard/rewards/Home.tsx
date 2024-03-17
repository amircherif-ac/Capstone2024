// import Counter from "./components/Counter";

// export function Home() {
//   return (
//     <div>
//       <h1>My profile</h1>
//       <Counter />
//     </div>
//   );
// }
import React from "react";
import Counter from "../../../components/Counter";

type HomeProps = {};

const Home: React.FC<HomeProps> = () => {
  return (
    <div>
      <h1>My profile</h1>
      <Counter />
    </div>
  );
};
export default Home;
