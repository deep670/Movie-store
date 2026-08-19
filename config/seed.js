const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const User = require('../models/User');

const seedMovies = [
  {
    title: 'Blade Runner 2049',
    description: 'Young Blade Runner K\'s discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who\'s been missing for thirty years.',
    genre: 'Sci-Fi',
    price: 499,
    posterUrl: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    rating: 8.0,
    year: 2017,
    duration: '2h 44min',
    director: 'Denis Villeneuve',
    featured: true
  },
  {
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    genre: 'Action',
    price: 399,
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911BTUgMe1nNaD3.jpg',
    rating: 9.0,
    year: 2008,
    duration: '2h 32min',
    director: 'Christopher Nolan',
    featured: true
  },
  {
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    genre: 'Sci-Fi',
    price: 449,
    posterUrl: 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
    rating: 8.8,
    year: 2010,
    duration: '2h 28min',
    director: 'Christopher Nolan',
    featured: true
  },
  {
    title: 'Parasite',
    description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    genre: 'Thriller',
    price: 349,
    posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    rating: 8.5,
    year: 2019,
    duration: '2h 12min',
    director: 'Bong Joon-ho',
    featured: true
  },
  {
    title: 'The Grand Budapest Hotel',
    description: 'A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy in the hotel\'s glorious years under an exceptional concierge.',
    genre: 'Comedy',
    price: 299,
    posterUrl: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg',
    rating: 8.1,
    year: 2014,
    duration: '1h 39min',
    director: 'Wes Anderson',
    featured: false
  },
  {
    title: 'Interstellar',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    genre: 'Sci-Fi',
    price: 549,
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    rating: 8.7,
    year: 2014,
    duration: '2h 49min',
    director: 'Christopher Nolan',
    featured: true
  },
  {
    title: 'Get Out',
    description: 'A young African-American visits his white girlfriend\'s parents for the weekend, where his simmering uneasiness about their reception of him eventually reaches a boiling point.',
    genre: 'Horror',
    price: 299,
    posterUrl: 'https://image.tmdb.org/t/p/w500/qbaIY2KiSM4DsqxHCOud8JRKGsq.jpg',
    rating: 7.7,
    year: 2017,
    duration: '1h 44min',
    director: 'Jordan Peele',
    featured: false
  },
  {
    title: 'La La Land',
    description: 'While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.',
    genre: 'Romance',
    price: 349,
    posterUrl: 'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKRhcorwFR9odd.jpg',
    rating: 8.0,
    year: 2016,
    duration: '2h 8min',
    director: 'Damien Chazelle',
    featured: false
  },
  {
    title: 'Mad Max: Fury Road',
    description: 'In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of a group of female prisoners and a lone drifter.',
    genre: 'Action',
    price: 399,
    posterUrl: 'https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg',
    rating: 8.1,
    year: 2015,
    duration: '2h 0min',
    director: 'George Miller',
    featured: false
  },
  {
    title: 'Spider-Man: Into the Spider-Verse',
    description: 'Teen Miles Morales becomes the Spider-Man of his universe and must join with five spider-powered individuals from other dimensions to stop a threat.',
    genre: 'Animation',
    price: 349,
    posterUrl: 'https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
    rating: 8.4,
    year: 2018,
    duration: '1h 57min',
    director: 'Peter Ramsey',
    featured: true
  },
  {
    title: 'The Shawshank Redemption',
    description: 'Over the course of several years, two convicts form a friendship, seeking consolation and eventual redemption through basic compassion.',
    genre: 'Drama',
    price: 249,
    posterUrl: 'https://image.tmdb.org/t/p/w500/9cjIGRQL3sGGIRFylFMsSuERSoj.jpg',
    rating: 9.3,
    year: 1994,
    duration: '2h 22min',
    director: 'Frank Darabont',
    featured: false
  },
  {
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
    genre: 'Adventure',
    price: 599,
    posterUrl: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nez7S.jpg',
    rating: 8.6,
    year: 2024,
    duration: '2h 46min',
    director: 'Denis Villeneuve',
    featured: true
  }
];

const seedDatabase = async () => {
  try {
    // Check if movies already exist
    const movieCount = await Movie.countDocuments();
    if (movieCount === 0) {
      await Movie.insertMany(seedMovies);
      console.log('🎬 Seeded 12 movies');
    } else {
      console.log(`🎬 Movies already exist (${movieCount} found), skipping seed`);
    }

    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@moviestore.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@moviestore.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('👤 Created admin: admin@moviestore.com / admin123');
    } else {
      console.log('👤 Admin already exists, skipping');
    }
  } catch (error) {
    console.error('❌ Seed error:', error.message);
  }
};

module.exports = { seedDatabase };
