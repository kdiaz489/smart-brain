import React, { Component } from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation.js';
import Logo from  './components/Logo/Logo.js';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.js'
import Rank from './components/Rank/Rank.js'
import Signin from './components/Signin/Signin.js';
import Register from './components/Register/Register.js';
import Particles from 'react-particles-js'

import FaceRecognition from './components/FaceRecognition/FaceRecognition.js'




const particlesOptions ={
  particles: {
    number:{

        value: 30,
        density: {
          enable: true,
          value_area: 800
      }
    }
  }
}

const initialState ={
      input: '',
      imageUrl: '',
      box :{},
      //when constructor loads, will initially be on signin route
      route: 'signin',
      isSignedIn: false,
      user:{
        id:'',
        name:'',
        email:'',
        entries:0,
        joinded:''

      }

}
class App extends Component {
  constructor(){
    super()
    this.state = initialState;
  }
/*
componentDidMount(){
  fetch('http://localhost:3000')
  .then(response => response.json())
  .then(console.log)
}
*/
loadUser = (data) =>{
  this.setState({user: {
    id:data.id,
    name: data.name,
    email: data.email,
    entries: data.entries,
    joined: data.joined
  }})
}
calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return{
      leftCol : clarifaiFace.left_col * width,
      topRow : clarifaiFace.top_row * height,
      rightCol : width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
}


displayFaceBox = (box) => {

  this.setState({box: box})
  
}

onInputChange = (event) =>{
  this.setState({input: event.target.value});

}

onButtonSubmit = () =>{
  this.setState({imageUrl: this.state.input});
    fetch('https://serene-wave-22805.herokuapp.com/imageurl',{
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        input:this.state.input
        })
    })
    .then(response => response.json())
    .then(response => {
      if(response){
        fetch('https://serene-wave-22805.herokuapp.com/image',{
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
            })
        })
        .then(response => response.json())
        .then(count =>{
          this.setState(Object.assign(this.state.user, {entries: count}))
        })
        .catch(console.log);

      }
      this.displayFaceBox(this.calculateFaceLocation(response))
        //console.log(response.outputs[0].data.regions[0].region_info.bounding_box);
      })
      .catch(err => console.log(err));
    
}

  onRouteChange = (route) =>{
    if(route === 'signout'){
      this.setState(initialState);
    }
    else if(route === 'home'){

      this.setState({isSignedIn:true});
    }
    //No matter what, always wanna change state, no else{} needed
    this.setState({route:route});
    
  }

  render() {

    const {isSignedIn, imageUrl, route, box} = this.state;

    return (
      <div className="App">

        <Particles className = 'particles'
          params={particlesOptions}

        />

       <Navigation isSignedIn={isSignedIn} onRouteChange = {this.onRouteChange} />

       {route === 'home' 
         ? <div> 

              <Logo/>
              <Rank name ={this.state.user.name} entries = {this.state.user.entries}/>
              <ImageLinkForm 
                onInputChange ={this.onInputChange} 
                onButtonSubmit = {this.onButtonSubmit}/>
              <FaceRecognition box = {box} imageUrl = {imageUrl}/>
            </div>
            :(
              this.state.route ==='signin' 
              //if signin, then return sign in component
              ? <Signin loadUser = {this.loadUser} onRouteChange ={this.onRouteChange}/>
              //otherwise, return register component
              : <Register loadUser ={this.loadUser} onRouteChange={this.onRouteChange}/>

              )
        
      }
      </div>
    );
  }
}

export default App;
