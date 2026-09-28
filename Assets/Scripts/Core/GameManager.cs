using UnityEngine;

namespace MotoEntrega3D.Core
{
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        public int Money { get; private set; }
        public int CompletedDeliveries { get; private set; }

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        public void AddReward(int amount)
        {
            Money += Mathf.Max(0, amount);
        }

        public void RegisterDelivery()
        {
            CompletedDeliveries++;
        }
    }
}
