using UnityEngine;
using MotoEntrega3D.Core;

namespace MotoEntrega3D.Delivery
{
    public enum DeliveryState
    {
        WaitingForOrder,
        GoingToPickup,
        CarryingOrder,
        GoingToCustomer,
        Completed,
        Failed
    }

    public class DeliveryManager : MonoBehaviour
    {
        public static DeliveryManager Instance { get; private set; }

        [SerializeField] private Transform pickupPoint;
        [SerializeField] private Transform customerPoint;

        public DeliveryState State { get; private set; } = DeliveryState.WaitingForOrder;
        public DeliveryOrder CurrentOrder { get; private set; }
        public float RemainingTime { get; private set; }

        private void Awake()
        {
            Instance = this;
        }

        public void StartOrder()
        {
            CurrentOrder = new DeliveryOrder(
                "PED-001",
                "Cliente da primeira entrega",
                "Restaurante Central",
                18,
                180f
            );

            RemainingTime = CurrentOrder.timeLimitSeconds;
            State = DeliveryState.GoingToPickup;
        }

        private void Update()
        {
            if (State != DeliveryState.GoingToPickup &&
                State != DeliveryState.CarryingOrder &&
                State != DeliveryState.GoingToCustomer)
                return;

            RemainingTime -= Time.deltaTime;

            if (RemainingTime <= 0f)
            {
                RemainingTime = 0f;
                State = DeliveryState.Failed;
            }
        }

        public void ArriveAtPickup()
        {
            if (State == DeliveryState.GoingToPickup)
                State = DeliveryState.CarryingOrder;
        }

        public void ArriveAtCustomer()
        {
            if (State != DeliveryState.CarryingOrder &&
                State != DeliveryState.GoingToCustomer)
                return;

            State = DeliveryState.Completed;
            GameManager.Instance.AddReward(CurrentOrder.reward);
            GameManager.Instance.RegisterDelivery();
        }

        public Transform CurrentTarget =>
            State == DeliveryState.GoingToPickup ? pickupPoint :
            State == DeliveryState.CarryingOrder ? customerPoint : null;
    }
}
