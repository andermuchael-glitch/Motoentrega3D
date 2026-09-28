using UnityEngine;
using UnityEngine.UI;
using TMPro;
using MotoEntrega3D.Core;
using MotoEntrega3D.Delivery;
using MotoEntrega3D.Player;

namespace MotoEntrega3D.UI
{
    public class DeliveryHUD : MonoBehaviour
    {
        [SerializeField] private TMP_Text orderText;
        [SerializeField] private TMP_Text moneyText;
        [SerializeField] private TMP_Text timerText;
        [SerializeField] private TMP_Text speedText;
        [SerializeField] private Button startButton;

        private void Update()
        {
            var manager = DeliveryManager.Instance;
            if (manager == null) return;

            moneyText.text = $"R$ {GameManager.Instance.Money:0.00}";

            if (manager.CurrentOrder != null)
            {
                orderText.text = $"{manager.CurrentOrder.pickupName} → {manager.CurrentOrder.customerName}";
                timerText.text = FormatTime(manager.RemainingTime);
            }
            else
            {
                orderText.text = "Nenhum pedido";
                timerText.text = "--:--";
            }
        }

        public void StartDelivery()
        {
            DeliveryManager.Instance.StartOrder();
            if (startButton != null)
                startButton.gameObject.SetActive(false);
        }

        public void UpdateSpeed(MotorcycleController motorcycle)
        {
            if (motorcycle != null)
                speedText.text = $"{motorcycle.SpeedKmh:0} km/h";
        }

        private string FormatTime(float seconds)
        {
            int minutes = Mathf.FloorToInt(seconds / 60f);
            int secs = Mathf.FloorToInt(seconds % 60f);
            return $"{minutes:00}:{secs:00}";
        }
    }
}
