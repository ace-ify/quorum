"""
In-Memory Mock of the Switch Agent Protocol & Router.
Enforces true server-side room isolation for testing and instant simulation.
"""
import asyncio
from typing import Dict, List, Set, Callable, Any, Optional

class MockSwitchClient:
    def __init__(self, workspace_id: str = "quorum-eng"):
        self.workspace_id = workspace_id
        # room_id -> Set of agent_ids/user_ids
        self.rooms: Dict[str, Set[str]] = {}
        # agent_id -> list of subscribed callbacks: Callable[[dict], None]
        self.subscribers: Dict[str, List[Callable[[dict], Any]]] = {}
        # Room documents
        self.documents: Dict[str, Dict[str, Any]] = {}
        # Message audit log for isolation proof
        self.delivered_events: Dict[str, List[dict]] = {} # agent_id -> list of events received

    @property
    def network_packets_leaked(self) -> int:
        """Counts total cross-chamber packet leakage across all registered rooms."""
        count = 0
        for agent_id, events in self.delivered_events.items():
            for evt in events:
                rid = evt.get("room_id")
                if rid and agent_id not in self.rooms.get(rid, set()):
                    count += 1
        return count

    async def create_room(self, room_id: str, initial_members: List[str], topic: str = "") -> dict:
        """
        Creates a room and assigns initial members.
        """
        if room_id not in self.rooms:
            self.rooms[room_id] = set(initial_members)
        else:
            self.rooms[room_id].update(initial_members)
        return {"room_id": room_id, "members": list(self.rooms[room_id]), "topic": topic}

    async def add_member(self, room_id: str, member_id: str):
        if room_id in self.rooms:
            self.rooms[room_id].add(member_id)

    async def register_agent(self, agent_id: str, callback: Callable[[dict], Any]):
        """
        Registers an agent WebSocket subscriber.
        """
        if agent_id not in self.subscribers:
            self.subscribers[agent_id] = []
            self.delivered_events[agent_id] = []
        self.subscribers[agent_id].append(callback)

    async def post_message(self, sender_id: str, room_id: str, content: str, metadata: Optional[dict] = None) -> dict:
        """
        Posts a message to a room.
        Crucial Switch rule: Delivers ONLY to subscribers who are active members of room_id!
        """
        if room_id not in self.rooms:
            raise ValueError(f"Room '{room_id}' does not exist on Switch.")

        event = {
            "type": "message.created",
            "room_id": room_id,
            "sender_id": sender_id,
            "content": content,
            "metadata": metadata or {},
        }

        # Deliver only to members
        members = self.rooms[room_id]
        deliveries = []
        for member_id in members:
            if member_id in self.subscribers:
                self.delivered_events[member_id].append(event)
                for cb in self.subscribers[member_id]:
                    # Call async or sync callback
                    res = cb(event)
                    if asyncio.iscoroutine(res):
                        deliveries.append(res)

        if deliveries:
            await asyncio.gather(*deliveries)

        return event

    async def send_targeted_message(self, sender_id: str, target_agent_id: str, content: str) -> dict:
        """
        Sends a 1-on-1 direct targeted message.
        """
        event = {
            "type": "targeted.message",
            "sender_id": sender_id,
            "target_id": target_agent_id,
            "content": content,
        }
        if target_agent_id in self.subscribers:
            self.delivered_events[target_agent_id].append(event)
            deliveries = []
            for cb in self.subscribers[target_agent_id]:
                res = cb(event)
                if asyncio.iscoroutine(res):
                    deliveries.append(res)
            if deliveries:
                await asyncio.gather(*deliveries)
        return event

    async def set_room_document(self, room_id: str, doc_name: str, data: Any):
        if room_id not in self.documents:
            self.documents[room_id] = {}
        self.documents[room_id][doc_name] = data

    async def get_room_document(self, room_id: str, doc_name: str) -> Optional[Any]:
        return self.documents.get(room_id, {}).get(doc_name)

    def verify_isolation(self, agent_id: str, unauthorized_room_id: str) -> bool:
        """
        Verifies that agent_id NEVER received any message from unauthorized_room_id.
        """
        received = self.delivered_events.get(agent_id, [])
        for evt in received:
            if evt.get("room_id") == unauthorized_room_id:
                return False
        return True

