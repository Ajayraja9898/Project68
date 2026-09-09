// ======================================================
// SOCKET.IO SERVICE
// ======================================================
//
// Stores the single Socket.IO instance created by
// server.js so controllers/services can safely access it
// without creating circular imports.
//
// ======================================================

let ioInstance = null;

// ======================================================
// SET SOCKET.IO INSTANCE
// ======================================================

export function setIO(io) {
  ioInstance = io;

  console.log(
    "✅ Socket.IO instance registered with socket service"
  );
}

// ======================================================
// GET SOCKET.IO INSTANCE
// ======================================================

export function getIO() {
  return ioInstance;
}

// ======================================================
// DISCONNECT ALL SOCKETS FOR A USER
// ======================================================

export function disconnectUserSockets(
  userId
) {
  if (
    !ioInstance ||
    !userId
  ) {
    return 0;
  }

  const targetUserId =
    String(userId);

  let disconnectedCount =
    0;

  for (
    const socket of
      ioInstance.sockets.sockets.values()
  ) {
    if (
      String(
        socket.userId
      ) ===
      targetUserId
    ) {
      console.log(
        "⛔ DISCONNECTING SUSPENDED USER SOCKET:",
        {
          socketId:
            socket.id,

          userId:
            targetUserId,
        }
      );

      socket.emit(
        "account:suspended",
        {
          code:
            "ACCOUNT_SUSPENDED",

          message:
            "Your account has been suspended by an administrator.",
        }
      );

      socket.disconnect(
        true
      );

      disconnectedCount++;
    }
  }

  return disconnectedCount;
}