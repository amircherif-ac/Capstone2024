// import { Col, Row } from "react-bootstrap";
// import { StoreItem } from "../components/StoreItem";
// import storeItems from "../data/items.json";
// import Counter from "../components/Counter";

// export function Store() {
//   return (
//     <>
//       <Counter />
//       <h1>Rewards</h1>
//       <Row md={2} xs={1} lg={3} className="g-3">
//         {storeItems.map((item) => (
//           <Col key={item.id}>
//             <StoreItem {...item} />
//           </Col>
//         ))}
//       </Row>
//     </>
//   );
// }

import React from "react";
import { User } from "models/lib/types";
import Counter from "../../../components/Counter";
import StoreItem from "../../../components/StoreItem";
import storeItems from "../../../data/items.json";
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Grid,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

type StoreProps = {
  thisUser?: User;
};

const Store: React.FC<StoreProps> = () => {
  return (
    <>
      <Counter />
      <h1>Rewards</h1>
      <Grid md={2} xs={1} lg={3} className="g-3">
        {storeItems.map((item) => (
          <Stack key={item.id}>
            <StoreItem {...item} />
          </Stack>
        ))}
      </Grid>
      {/* <h1>Rewards</h1>
      <Row md={2} xs={1} lg={3} className="g-3">
        {storeItems.map((item) => (
          <Col key={item.id}>
            <StoreItem {...item} />
          </Col>
        ))}
      </Row> */}
    </>
  );
};
export default Store;
