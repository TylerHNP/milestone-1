import './App.css';
import TextEditor from './TextEditor';

function App() {
  return (
    // <Router>
    //   <Switch>
    //     <Route path="/" exact>
    //       <Redirect to={`/connect/${uuidV4()}`} />
    //     </Route>
    //     <Route path="/connect/:id">
    //       <TextEditor />
    //     </Route>
    //   </Switch>
    // </Router>
    <TextEditor />

  );
}

export default App;
