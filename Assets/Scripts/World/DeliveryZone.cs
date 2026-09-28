using UnityEngine;
using MotoEntrega3D.Delivery;

namespace MotoEntrega3D.World
{
    public enum ZoneType { Pickup, Customer }

    public class DeliveryZone : MonoBehaviour
    {
        [SerializeField] private ZoneType zoneType;

        private void OnTriggerEnter(Collider other)
        {
            if (!other.CompareTag("Player")) return;

            if (zoneType == ZoneType.Pickup)
                DeliveryManager.Instance.ArriveAtPickup();
            else
                DeliveryManager.Instance.ArriveAtCustomer();
        }
    }
}
