const Book = require('../models/book');

/* Create */
exports.createBook = (req, res) => {
    delete req.body._id;
    const book = new Book({
        ...req.body
    });
    book.save()
        .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.createRatingBook = (req, res) => {
    Book.findOne({ _id: req.params.id })
};
/* - */

/* Read */ 
exports.getAllBook = (req, res) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

exports.getOneBook = (req, res) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
};

exports.getBooksWithBestRating = (req, res) => {
    Book.find()
        .sort({ averageRating: -1 })
        .limit(3)
        .then(bestRating => {
            res.status(200).json(bestRating);
        })
        .catch(error => {
            res.status(500).json({ error: 'Erreur lors de la récupération des livres les mieux notés' });
        });
};
/* - */

/* Update */ 
exports.updateOneBook = (req, res) => {
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
};
/* - */

/* Delete */
exports.deleteOneBook = (req, res) => {
    Book.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
        .catch(error => res.status(400).json({ error }));
};
/* - */