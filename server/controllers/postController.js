import Post from "../models/Post.js";

// ==========================================
// Get All Community Posts
// ==========================================
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate(
        "author",
        "_id name rollNumber avatar department year"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.log("GET POSTS ERROR");
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==========================================
// Create Community Post
// ==========================================
export const createPost = async (req, res) => {
  try {
    const { content, category } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Post content is required",
      });
    }

    const post = await Post.create({
      author: req.user._id,
      content: content.trim(),
      category: category || "General",
    });

    const populatedPost = await Post.findById(post._id).populate(
      "author",
      "_id name rollNumber avatar department year"
    );

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.log("CREATE POST ERROR");
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==========================================
// Delete Own Post
// ==========================================
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (
      post.author.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts",
      });
    }

    await Post.findByIdAndDelete(postId);

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.log("DELETE POST ERROR");
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==========================================
// Like / Unlike Post
// ==========================================
export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const alreadyLiked = post.likes.some(
      (id) =>
        id.toString() === userId.toString()
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) =>
          id.toString() !==
          userId.toString()
      );
    } else {
      post.likes.push(userId);
    }

    await post.save();

    const updatedPost =
      await Post.findById(postId).populate(
        "author",
        "_id name rollNumber avatar department year"
      );

    return res.status(200).json({
      success: true,
      liked: !alreadyLiked,
      likes: updatedPost.likes.length,
      post: updatedPost,
    });
  } catch (error) {
    console.log("TOGGLE LIKE ERROR");
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
