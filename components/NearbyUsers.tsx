"use client"
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push } from 'firebase/database';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {  Badge, Hash, MessageSquare, Plus, Upload, UserPlus, Users, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Input } from "./ui/input"
// import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
// import { toast } from "./ui/use-toast"
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  measurementId:  process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};


const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

const NearbyUsers = () => {
    const [username, setUsername] = useState('');
    const [isDiscoverable, setIsDiscoverable] = useState(false);
    const [nearbyUsers, setNearbyUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [userId, setUserId] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [newGroupName, setNewGroupName] = useState('');
    const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);
  
    const { toast } = useToast()
  

  // Sign in anonymously when component mounts
  useEffect(() => {
    const signIn = async () => {
      try {
        const userCredential = await signInAnonymously(auth);
        setUserId(userCredential.user.uid);
        
        // Set up cleanup of user data when component unmounts
        const userRef = ref(database, `users/${userCredential.user.uid}`);
        return () => {
          set(userRef, null);
        };
      } catch (error) {
        console.error('Error signing in:', error);
        toast({
          description: "Error connecting to the service.",
          variant: "destructive"
        });
      }
    };

    signIn();
  }, []);

  // Update user's last seen timestamp periodically
  useEffect(() => {
    if (!userId || !isDiscoverable) return;

    const updateLastSeen = async () => {
      try {
        const userRef = ref(database, `users/${userId}`);
        await set(userRef, {
          id: userId,
          username,
          isDiscoverable: true,
          lastSeen: Date.now(),
        });
      } catch (error) {
        console.error('Error updating last seen:', error);
      }
    };

    updateLastSeen();
    const interval = setInterval(updateLastSeen, 5000);

    return () => clearInterval(interval);
  }, [userId, isDiscoverable, username]);

  // Listen for nearby users
  useEffect(() => {
    if (!userId) return;

    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const users = [];
      snapshot.forEach((childSnapshot) => {
        const user = childSnapshot.val();
        // Filter out inactive users (last seen more than 30 seconds ago)
        if (user && 
            user.id !== userId && 
            user.isDiscoverable && 
            Date.now() - user.lastSeen < 30000) {
          users.push(user);
        }
      });
      setNearbyUsers(users);
    });

    return () => unsubscribe();
  }, [userId]);

  // Listen for messages
  useEffect(() => {
    if (!userId || !selectedUser) return;

    const chatId = [userId, selectedUser.id].sort().join('-');
    const messagesRef = ref(database, `messages/${chatId}`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const messageList = [];
      snapshot.forEach((childSnapshot) => {
        messageList.push(childSnapshot.val());
      });
      setMessages(messageList.sort((a, b) => a.timestamp - b.timestamp));
    });

    return () => unsubscribe();
  }, [userId, selectedUser]);

  const toggleDiscoverable = async () => {
    if (!username.trim()) {
      toast({
        description: "Please enter a username first.",
        variant: "destructive"
      });
      return;
    }

    try {
      const newStatus = !isDiscoverable;
      await set(ref(database, `users/${userId}`), {
        id: userId,
        username,
        isDiscoverable: newStatus,
        lastSeen: Date.now(),
      });
      setIsDiscoverable(newStatus);
      toast({
        description: newStatus ? "You are now discoverable!" : "You are no longer discoverable.",
      });
    } catch (error) {
      console.error('Error toggling discoverable status:', error);
      toast({
        description: "Error updating status.",
        variant: "destructive"
      });
    }
  };

 

   // Listen for groups
   useEffect(() => {
    if (!userId) return;

    const groupsRef = ref(database, 'groups');
    const unsubscribe = onValue(groupsRef, (snapshot) => {
      const groupsList = [];
      snapshot.forEach((childSnapshot) => {
        const group = childSnapshot.val();
        groupsList.push(group);
      });
      setGroups(groupsList);
    });

    return () => unsubscribe();
  }, [userId]);

  // Listen for group or direct messages
  useEffect(() => {
    if (!userId || (!selectedUser && !selectedGroup)) return;

    let messagesRef;
    if (selectedGroup) {
      messagesRef = ref(database, `groupMessages/${selectedGroup.id}`);
    } else {
      const chatId = [userId, selectedUser.id].sort().join('-');
      messagesRef = ref(database, `messages/${chatId}`);
    }

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const messageList = [];
      snapshot.forEach((childSnapshot) => {
        messageList.push(childSnapshot.val());
      });
      setMessages(messageList.sort((a, b) => a.timestamp - b.timestamp));
    });

    return () => unsubscribe();
  }, [userId, selectedUser, selectedGroup]);

  const createGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      const groupsRef = ref(database, 'groups');
      const newGroupRef = push(groupsRef);
      await set(newGroupRef, {
        id: newGroupRef.key,
        name: newGroupName,
        createdBy: userId,
        createdAt: Date.now(),
        members: {
          [userId]: username
        }
      });
      setNewGroupName('');
      setShowNewGroupDialog(false);
      toast({
        description: "Group created successfully!",
      });
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        description: "Error creating group.",
        variant: "destructive"
      });
    }
  };

  const joinGroup = async (group) => {
    try {
      const groupRef = ref(database, `groups/${group.id}/members/${userId}`);
      await set(groupRef, username);
      setSelectedGroup(group);
      setSelectedUser(null);
      toast({
        description: `Joined ${group.name}!`,
      });
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        description: "Error joining group.",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async (file = null) => {
    if ((!newMessage.trim() && !file) || (!selectedUser && !selectedGroup)) return;

    try {
      let messageData = {
        senderId: userId,
        senderName: username,
        timestamp: Date.now(),
      };

      if (file) {
        const fileRef = storageRef(storage, `files/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(fileRef);
        messageData = {
          ...messageData,
          type: 'file',
          fileName: file.name,
          fileURL: downloadURL
        };
      } else {
        messageData = {
          ...messageData,
          type: 'text',
          text: newMessage
        };
      }

      let messagesRef;
      if (selectedGroup) {
        messagesRef = ref(database, `groupMessages/${selectedGroup.id}`);
      } else {
        const chatId = [userId, selectedUser.id].sort().join('-');
        messagesRef = ref(database, `messages/${chatId}`);
      }

      await push(messagesRef, messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        description: "Error sending message.",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        description: "File size must be less than 5MB.",
        variant: "destructive"
      });
      return;
    }

    await sendMessage(file);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Your Username</label>
        <div className="flex gap-2">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            disabled={isDiscoverable}
          />
          <Button
            onClick={toggleDiscoverable}
            variant={isDiscoverable ? "destructive" : "default"}
          >
            {isDiscoverable ? (
              <>
                <Users className="w-4 h-4 mr-2" />
                Hide Me
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Make Discoverable
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Groups</h3>
            <Dialog open={showNewGroupDialog} onOpenChange={setShowNewGroupDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Enter group name"
                  />
                  <Button onClick={createGroup}>Create Group</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2">
            {groups.map((group) => (
              <div
                key={group.id}
                className={`p-3 rounded-lg flex items-center justify-between ${
                  selectedGroup?.id === group.id ? 'bg-blue-50' : 'bg-gray-50'
                }`}
              >
                <div>
                  <span className="font-medium">{group.name}</span>
                  <Badge variant="secondary" className="ml-2">
                    {Object.keys(group.members || {}).length} members
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => joinGroup(group)}
                >
                  {selectedGroup?.id === group.id ? 'Joined' : 'Join'}
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-bold mb-4">Nearby Users</h3>
          <div className="space-y-2">
            {nearbyUsers.map((user) => (
              <div
                key={user.id}
                className={`p-3 rounded-lg flex items-center justify-between ${
                  selectedUser?.id === user.id ? 'bg-blue-50' : 'bg-gray-50'
                }`}
              >
                <div>
                  <span className="font-medium">{user.username}</span>
                  <Badge variant="secondary" className="ml-2">
                    {Math.round((Date.now() - user.lastSeen) / 1000)}s ago
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedUser(user);
                    setSelectedGroup(null);
                  }}
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {(selectedUser || selectedGroup) && (
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">
                {selectedGroup ? (
                  <div className="flex items-center">
                    <Hash className="w-4 h-4 mr-2" />
                    {selectedGroup.name}
                  </div>
                ) : (
                  `Chat with ${selectedUser.username}`
                )}
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedUser(null);
                  setSelectedGroup(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="h-[300px] overflow-y-auto mb-4 space-y-2">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg ${
                    message.senderId === userId
                      ? 'bg-blue-100 ml-auto'
                      : 'bg-gray-100'
                  } max-w-[80%]`}
                >
                  {message.type === 'file' ? (
                    <div className="space-y-1">
                      <a
                        href={message.fileURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {message.fileName}
                      </a>
                      <span className="text-xs text-gray-500">
                        {message.senderName} • {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm">{message.text}</p>
                      <span className="text-xs text-gray-500">
                        {message.senderName} • {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-upload').click()}
              >
                <Upload className="w-4 h-4" />
              </Button>
              <Button onClick={() => sendMessage()}>Send</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyUsers;