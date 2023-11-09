const express = require('express');
const mongoose = require('mongoose');
const app = express();
const Book = require('./models/book');
const multer = require('multer');
const upload = multer({ dest: './upload' });

mongoose.connect('mongodb+srv://cardinaljv:1234@cluster0.dxma3vv.mongodb.net/?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

/* Routes liée au model book */

// Create
app.post('/api/books', (req, res) => {
    delete req.body._id;
    const book = new Book({
        ...req.body
    });
    book.save()
        .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
        .catch(error => res.status(400).json({ error }));
});

app.post('/api/books/:id/rating', (req, res) => {
    Book.findOne({ _id: req.params.id })
})

// Read
app.get('/api/books', (req, res) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
});

app.get('/api/books/:id', (req, res) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
});

app.get('/api/bestrating', (req, res) => {
    Book.find()
        .sort({ averageRating: -1 })
        .limit(3)
        .then(bestRating => {
            res.status(200).json(bestRating);
        })
        .catch(error => {
            res.status(500).json({ error: 'Erreur lors de la récupération des livres les mieux notés' });
        });
});

// Update
app.put('/api/books/:id', upload.single('image'), (req, res) => {
    if (req.file) {
        Book.updateOne(
            { _id: req.params.id },
            {
                title: req.body.title,
                author: req.body.author,
                content: text,
                imageUrl: req.file.path,
            }
        )
            .then(() => {
                if (req.body.oldImageUrl) {
                    fs.unlinkSync(req.body.oldImageUrl);
                }
                res.status(200).json({ message: 'Livre modifié' });
            })
            .catch(error => res.status(400).json({ error }));
    } else {
        Book.updateOne(
            { _id: req.params.id },
            {
                title: req.body.title,
                author: req.body.author,
                year: req.body.year,
                genre: req.body.genre,
                ratings: req.body.ratings,
            }
        )
            .then(() => res.status(200).json({ message: 'Livre modifié' }))
            .catch(error => res.status(400).json({ error }));
    }
});

// Delete
app.delete('/api/books/:id', (req, res) => {
    Book.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
        .catch(error => res.status(400).json({ error }));
});

/* - */

module.exports = app;