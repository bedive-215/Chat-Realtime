import { Router } from 'express';
import { getFriends, 
    getFriendRequests, 
    sendFriendRequest, 
    acceptFriendRequest,  
    rejectFriendRequest, 
    cancelFriendRequest, 
    unfriend,
    getFriendsInfo
 } from '../controllers/friend.controller.js';

const router = Router();

router.get("/friends", getFriends);
router.get('/friends-info', getFriendsInfo);
router.get("/friends/requests", getFriendRequests);
router.post("/friends/request/:friendId", sendFriendRequest);
router.post("/friends/accept/:requesterId", acceptFriendRequest);
router.post("/friends/reject/:requesterId", rejectFriendRequest);
router.post("/friends/cancel/:friendId", cancelFriendRequest);
router.post("/friends/unfriend/:friendId", unfriend);

export default router;