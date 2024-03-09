const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Post = require('./models/post');
require('dotenv').config();
const path=require('path');

const app = express();
const port = process.env.PORT || 3000;


const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/blog', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
});

postSchema.index({ title: 'text' }); 
const Post1 = mongoose.model('post', postSchema);

connectDB();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', async (req, res) => {
 const posts = await Post.find().limit(10); 
  res.render('index', { posts });
});

app.get('/new', (req, res) => {
  res.render('new');
});

app.post('/new', async (req, res) => {
  const { title, content } = req.body;
  const post = new Post({ title, content });

  try {
    await post.save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('new', { post });
  }
});

app.get('/show/:id', async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.render('show', { post });
});
app.get('/edit/:id', async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.render('edit', { post });
});


app.post('/edit/:id', async (req, res) => {
  const { title, content } = req.body;

  try {
      await Post.findByIdAndUpdate(req.params.id, { title, content });
      res.redirect(`/show/${req.params.id}`);
  } catch (err) {
      console.error(err);
      res.render('edit', { post: { _id: req.params.id, title, content } });
  }
});


app.get('/delete/:id', async (req, res) => {
  try {
      await Post.findByIdAndDelete(req.params.id);
      res.redirect('/');
  } catch (err) {
      console.error(err);
      res.redirect('/');
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
