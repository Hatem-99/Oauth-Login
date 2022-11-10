import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import UsersModel from '../model.js'

export const createAccessToken = (payload) =>
  new Promise((res, rej) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "15 minute" },
      (err, token) => {
        if (err) rej(err);
        else res(token);
      }
    )
  );

export const verifyAccessToken = (accessToken) =>
  new Promise((res, rej) => {
    jwt.verify(accessToken, process.env.JWT_SECRET, (err, originalPayload) => {
      if (err) rej(err);
      else res(originalPayload);
    });
  });

export const createAccessRefreshToken = (payload) =>
  new Promise((res, rej) =>
    jwt.sign(
      payload,
      process.env.REFRESH_SECRET,
      { expiresIn: "1 week" },
      (err, token) => {
        if (err) rej(err);
        else res(token);
      }
    )
  );

export const verifyAccessRefreshToken = (accessToken) =>
  new Promise((res, rej) => {
    jwt.verify(
      accessToken,
      process.env.REFRESH_SECRET,
      (err, originalPayload) => {
        if (err) rej(err);
        else res(originalPayload);
      }
    );
  });

export const createTokens = async (user) => {
  const accessToken = await createAccessToken({
    _id: user._id,
    role: user.role,
  });

  const refreshToken = await createAccessRefreshToken({ _id: user._id });

  user.refreshToken = refreshToken;
  await user.save();
  return { accessToken, refreshToken };
};

export const verifyRefreshAndCreateNewTokens = async (currentRefreshToken) => {
  try {
    const refreshTokenPayload = await verifyAccessRefreshToken(currentRefreshToken);
    
    const user = await UsersModel.findById(refreshTokenPayload._id);
    
    if (!user)
      throw new createHttpError(
        404,
        `User with id ${refreshTokenPayload._id} not found!`
      );
    if (user.refreshToken && user.refreshToken === currentRefreshToken) {
      const { accessToken, refreshToken } = await createTokens(user);
      return { accessToken, refreshToken };
    } else {
      throw new createHttpError(401, "Refresh token not valid!");
    }
  } catch (error) {
    console.log(error)
    throw new createHttpError(401, "Refresh token not valid!!!");
  }
};
