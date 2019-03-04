---
title: "React: From the Start"
date: 27 Sep 2018
published: true
---

React tutorials have a habit of not starting at the beginning. However, the beginning is usually a good place to start, so let's start there.

### 1.

For a new project, let's start with a new clean directory.

React is a JavaScript library, like lodash or moment, so we will need to install it with a package manager&mdash;we will use npm. In our new directory:

<pre class="bg-moon-gray">
echo "{}" >> package.json
</pre>

This will create a JSON file with an empty object in it. Then you can install and save to that package.json file the relevant dependencies. Without this, npm may not be able to save the dependencies to package.json.

<pre class="bg-moon-gray">npm i --save react</pre>

<p>This will have installed react in our local directory/project under node_modules, as well as saved the dependency in package.json.</p>

<p>Now, in order to render react on the DOM, we need to pull in a package called react-dom. We do this with:</p>

<pre class="bg-moon-gray">npm i --save react-dom</pre>

<p>Now, we will want to set up a HTML page which we can easily target with our react code, so create a index.html in the root of the directory. Then create a src directory, which we will use to store our react code.</p>

<pre class="bg-moon-gray">
touch index.html
mkdir src
</pre>

<p>Then inside your index.html file, we want to specify some DOM node that we will target with our react code later on. So for now, add:</p>

<pre class="bg-moon-gray">
&lt;!-- index.html --&gt;
&lt;html&gt;
    &lt;div id="root"&gt;
    &lt;/div&gt;
&lt;/html&gt;
</pre>

<p>Fairly straightforward. A html tag and a div with an id attribute. It is the "root" id that we will target later on. Basically, this means that we will aim to insert our react code at the div containing the root id attribute.</p>

### 1.5.

<p>So can we write some code now?</p>

<p>Almost, but we need some way to turn our react code into something our browser can understand. To do this we will need to turn our react and the JSX that react generates into a more vanilla kinda of JavaScript. Although, truth be told, we don't do this ourselves; we just hand the task off to a compiler. The compiler we shall use is babel, but we shall not actually touch it as we will wrap it in webpack, so that our outputted JS is nicely bundled into a single file.</p>

<p>Here comes the various installations we need to install webpack and babel:</p>

<pre class="bg-moon-gray">
npm i --saveDev babel-core
npm i --saveDev babel-loader
npm i --saveDev babel-preset-es2015
npm i --saveDev babel-preset-react
npm i --saveDev webpack
npm i webpack -g
</pre>


<p>The reason we use the --saveDev flag here instead of the --save flag as above is because we want to specify that we depend on react and react-dom in production, whereas we only depend on babel and webpack as a dev dependency.</p>

<p>Now we have installed babel and webpack, we need to create a webpack config file. Funnily enough, this file is just called "webpack.config.js", so create that and specify the following config inside of it:</p>

<pre class="bg-moon-gray">
// webpack.config.js
var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: './main.js',
    output: { path: __dirname, filename: 'bundle.js'},
    module: {
        loaders: [
            {
                test: /.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['react', 'es2015']
                }
            }
        ]
    }
}
</pre>


<p>This just tells webpack what file it should compile (entry), what the output file should be called (output), and then to use babel with the react and es2015 presets (loaders). We will come back to main.js and bundle.js.</p>


<h4>2.</h4>

<p>Praise be, now we are done. With that out of the way, we can now start writing some react code. In src, create a file called src/App.jsx, or whatever you want it to be called. We will then begin by importing the react and react-dom packages.</p>

<pre class="bg-moon-gray">touch src/App.jsx</pre>

<pre class="bg-moon-gray">
// src/App.jsx
import React from 'react';
import ReactDOM from 'react-dom';
</pre>

<p>Now, we can create a class that extends the React.Component base class. This base class provides several built-in methods for free, which can be overwritten. For example, React.Component contains several "lifecyle" methods, which are methods that run at particular times during processing. We won't worry about these for now, instead create a simple class, with a constructor.</p>

<pre class="bg-moon-gray">
// src/App.jsx
import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
    constructor(props) {
        super(props);
    }
}
</pre>

<p>The constructor method is called before the app is mounted, which is just when the react component is created and inserted into the DOM. super(props) is called so that props are defined in the constructor, and the props are just the values passed into the react component. Again, nothing to worry about, just something to keep in mind.</p>

<p>Now we will want to create a render() method on this class. This is where the our HTML-like code (called JSX) will go. For example, we can do the following:</p>

<pre class="bg-moon-gray">
// src/App.jsx
import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            &lt;h1&gt;React: From the Start&lt;/h1&gt;
        );
    }
}
</pre>

<p>What will happen is that wherever we insert this component into the DOM, a h1 tag with the text "React: From the Start" will be rendered.</p>

<p>So how do we insert it?</p>

<p>This is where the react-dom module comes in. To tell react to render to a specific DOM node, we use react-dom's render() method. We pass it the react component we want to be rendered, as well as the target DOM node; like so:</p>

<pre class="bg-moon-gray">
// src/App.jsx
import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            &lt;h1&gt;React: From the Start&lt;/h1&gt;
        );
    }
}

ReactDOM.render(&lt;App /&gt;, document.getElementById('root'));
</pre>

<p>Then inside our index.html, we simply include the JavaScript that is compiled by babel.</p>
        <pre class="bg-moon-gray">
&lt;!-- index.html --&gt;
&lt;html&gt;
    &lt;div id="root"&gt;
    &lt;/div&gt;
    &lt;script src="bundle.js"&gt;&lt;/script&gt;
&lt;/html&gt;
</pre>


<h4>3.</h4>

<p>Wait what. When did we compile this react?</p>

<p>This is where the webpack config we wrote earlier comes in. Create a file in the root of the project called "main.js", and inside of it import the App:</p>

<pre class="bg-moon-gray">
// main.js
import App from './src/App.jsx'
</pre>

<p>Now run webpack in the root of the project. Webpack will use the config we wrote, look for main.js, and compile it into bundle.js.</p>

<img src="/images/webpack-1.png"></img>

<p>You should now have a bundle.js in the root of your project directory, and index.html should be able to load it. You can load it quickly in the browser by running a local server:</p>

<pre class="bg-moon-gray">php -S localhost:8080</pre>

<p>Then visit http://localhost:8080 in your browser.</p>

