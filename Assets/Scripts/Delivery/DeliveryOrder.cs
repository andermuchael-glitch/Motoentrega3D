using UnityEngine;

namespace MotoEntrega3D.Delivery
{
    [System.Serializable]
    public class DeliveryOrder
    {
        public string orderId;
        public string customerName;
        public string pickupName;
        public int reward;
        public float timeLimitSeconds;

        public DeliveryOrder(string id, string customer, string pickup, int value, float timeLimit)
        {
            orderId = id;
            customerName = customer;
            pickupName = pickup;
            reward = value;
            timeLimitSeconds = timeLimit;
        }
    }
}
