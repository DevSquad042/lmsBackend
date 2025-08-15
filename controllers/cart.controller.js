import Cart from '../models/cart.model.js'
import Course from '../models/course.model.js';

export const addToCart = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (cart) {
      // Use find() to check if course already in cart
      const existingItem = cart.courses.find(
        (item) => item.course.toString() === courseId
      );

      if (existingItem) {
        return res.status(400).json({ message: 'Course already in cart.' });
      }

      cart.courses.push({ course: courseId, addedAt: new Date() });
      await cart.save();

      return res.status(200).json({ message: 'Course added to cart successfully.', cart });
    } else {
      cart = new Cart({
        user: userId,
        courses: [{ course: courseId, addedAt: new Date() }]
      });
      await cart.save();

      return res.status(201).json({ message: 'Cart created and course added successfully.', cart });
    }
  } catch (error) {
    console.error('error while adding to cart:', error);
    res.status(500).json({ message: 'Error while adding course to cart' });
  }
};



export const removeFromCart = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.courses = cart.courses.filter(
      (item) => item.course && item.course.toString() !== courseId
    );
    await cart.save();

    res.status(200).json({ message: "Course removed from cart", cart });
  } catch (error) {
    res.status(500).json({ message: "Error removing from cart", error: error.message });
  }
};


export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId })
      .populate("courses.course", "title price thumbnail");

    if (!cart || cart.courses.length === 0) {
      return res.status(404).json({ message: "Cart is empty" });
    }

    // Map cart.courses to a cleaner structure for the response
    const coursesWithDetails = cart.courses.map(item => {
      return {
        cartItemId: item._id,        // id of the cart item
        addedAt: item.addedAt,
        courseId: item.course?._id,
        title: item.course?.title,
        price: item.course?.price,
        thumbnail: item.course?.thumbnail
      };
    });

    res.status(200).json({
      cartId: cart._id,
      userId: cart.user,
      courses: coursesWithDetails,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error: error.message });
  }
};
