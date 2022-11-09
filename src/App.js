import { Container } from "@material-ui/core";
import ProminentAppBar from "./layouts/ProminentAppBar";
import SimplePaper from "./layouts/SimplePaper";

function App() {
  return (
    <div>
      <ProminentAppBar />
      <Container fixed>
        <SimplePaper />
      </Container>
    </div>
  );
}

export default App;
