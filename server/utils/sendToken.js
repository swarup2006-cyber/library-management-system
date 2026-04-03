module.exports = (user, statusCode, res) => {
  const token = user.generateToken();

  res
    .status(statusCode)
    .cookie("token", token, {
      httpOnly: true,
    })
    .json({
      success: true,
      token,
      user,
    });
};