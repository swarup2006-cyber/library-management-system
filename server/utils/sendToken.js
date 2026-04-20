module.exports = (user, statusCode, res) => {
  const token = user.generateToken();
  const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };

  res
    .status(statusCode)
    .cookie("token", token, {
      httpOnly: true,
    })
    .json({
      success: true,
      token,
      user: safeUser,
    });
};
