const Book = require('../models/book');
const fs = require('fs');
const sharp = require('sharp');

/* Create */
exports.createBook = (req, res) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    // Spécifiez un chemin de sortie différent pour le fichier redimensionné
    const resizedFileName = `resized-${req.file.filename.replace(/\.[^.]+$/, '')}.webp}`;
    const resizedImagePath = `./images/${resizedFileName}`;
    // Utilisez Sharp pour redimensionner l'image
    sharp(req.file.path)
        .resize(206, 260)
        .toFormat('webp')
        .toFile(resizedImagePath, (err, info) => {
            if (err) {
                return res.status(401).json({ error: err.message });
            }
            // Supprimez le fichier original après redimensionnement
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Erreur lors de la suppression du fichier original:', unlinkErr);
                }
                // Créez l'objet Book avec l'URL redimensionnée
                const book = new Book({
                    ...bookObject,
                    userId: req.auth.userId,
                    imageUrl: `${req.protocol}://${req.get('host')}/images/${resizedFileName}`
                });
                // Sauvegardez le livre dans la base de données
                book.save()
                    .then(() => {
                        res.status(201).json({ message: 'Livre enregistré !' });
                    })
                    .catch(error => {
                        res.status(401).json({ error });
                    });
            })
        })
};

exports.createRatingBook = (req, res) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            // Vérifie que la note est comprise entre 1 et 5 et qu'une note n'a pas déja été attribuer par cette utilisateur 
            if (book.ratings.some(rating => rating.userId === req.userId) || (req.body.grade < 1 || req.body.grade > 5)) {
                res.status(500).json({ error: 'Erreur lors de la notation' });
            } else {
                // Ajoute la nouvelle évaluation
                book.ratings.push({
                    userId: req.body.userId,
                    grade: req.body.rating
                });
                // Calcule la nouvelle moyenne des notes
                const totalRatings = book.ratings.length;
                const sumOfRatings = book.ratings.reduce((acc, rating) => acc + rating.grade, 0);
                book.averageRating = sumOfRatings / totalRatings;
                book.averageRating = parseFloat(book.averageRating.toFixed(1));
                // Sauvegarde le livre
                book.save()
                    .then(book => {
                        res.status(200).json(book);
                    })
                    .catch(error => res.status(500).json({ error }));
            }
        })
        .catch(error => res.status(404).json({ error }));
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
        .then(book =>
            res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
};

exports.getBooksWithBestRating = (req, res) => {
    Book.find()
        .sort({ averageRating: -1 })
        .limit(3)
        .then(bestRating =>
            res.status(200).json(bestRating)
        )
        .catch(error => res.status(500).json({ error: 'Erreur lors de la récupération des livres les mieux notés' })
        )
};
/* - */

/* Update */
exports.updateOneBook = (req, res) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    delete bookObject._userId;
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé' });
            }
            if (book.userId !== req.auth.userId) {
                return res.status(401).json({ message: 'Non autorisé' });
            }
            // Spécifiez un chemin de sortie différent pour le fichier redimensionné
            const resizedFileName = `resized-${req.file.filename.replace(/\.[^.]+$/, '')}.webp}`;
            const resizedImagePath = `./images/${resizedFileName}`;
            // Utilisez Sharp pour redimensionner l'image
            sharp(req.file.path)
                .resize(206, 260)
                .toFormat('webp')
                .toFile(resizedImagePath, (err, info) => {
                    if (err) {
                        return res.status(401).json({ error: err.message });
                    }
                    // Supprimez le fichier original après redimensionnement
                    fs.unlink(req.file.path, (unlinkErr) => {
                        if (unlinkErr) {
                            console.error('Erreur lors de la suppression du fichier original:', unlinkErr);
                        }
                        // Mise à jour du livre avec la nouvelle URL redimensionnée
                        Book.updateOne({ _id: req.params.id }, { ...bookObject, imageUrl: `${req.protocol}://${req.get('host')}/images/${resizedFileName}`, _id: req.params.id })
                            .then(() => res.status(200).json({ message: 'Livre modifié!' }))
                            .catch((updateError) => res.status(401).json({ error: updateError.message }));
                    });
                });
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};
/* - */

/* Delete */
exports.deleteOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Livre supprimé !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};
/* - */