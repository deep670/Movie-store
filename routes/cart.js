const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Movie = require('../models/Movie');
const { protect } = require('../middleware/auth');

// GET /api/cart — get user cart with populated movie data
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.movieId');
    const cartItems = user.cart
      .filter(item => item.movieId) // filter out deleted movies
      .map(item => ({
        movieId: item.movieId._id,
        title: item.movieId.title,
        price: item.movieId.price,
        posterUrl: item.movieId.posterUrl,
        genre: item.movieId.genre,
        quantity: item.quantity
      }));
    
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({ success: true, cart: cartItems, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/cart/add — add movie to cart
router.post('/add', protect, async (req, res) => {
  try {
    const { movieId } = req.body;
    const user = await User.findById(req.user._id);

    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Check if already in cart
    const existingItem = user.cart.find(item => item.movieId.toString() === movieId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cart.push({ movieId, quantity: 1 });
    }

    await user.save();
    
    // Return updated cart
    const updatedUser = await User.findById(req.user._id).populate('cart.movieId');
    const cartItems = updatedUser.cart
      .filter(item => item.movieId)
      .map(item => ({
        movieId: item.movieId._id,
        title: item.movieId.title,
        price: item.movieId.price,
        posterUrl: item.movieId.posterUrl,
        genre: item.movieId.genre,
        quantity: item.quantity
      }));
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({ success: true, cart: cartItems, total, message: 'Added to cart' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/cart/remove/:movieId — remove from cart
router.delete('/remove/:movieId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter(item => item.movieId.toString() !== req.params.movieId);
    await user.save();

    res.json({ success: true, message: 'Removed from cart' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/cart/clear — clear entire cart
router.delete('/clear', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();

    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
