import unittest

from model import get_model, load_training_data, predict


class ComplaintClassifierTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.model = get_model()

    def test_dataset_has_six_classes(self):
        _texts, labels = load_training_data()
        self.assertEqual(set(labels), {"Roads", "Sanitation", "Water", "Electricity", "Drainage", "Other"})

    def test_streetlight_text_classifies_as_electricity(self):
        result = predict(self.model, "The streetlight outside the school has stopped working at night")
        self.assertEqual(result["category"], "Electricity")

    def test_garbage_text_classifies_as_sanitation(self):
        result = predict(self.model, "Garbage collection was missed and waste is piling up beside the road")
        self.assertEqual(result["category"], "Sanitation")

    def test_short_text_is_rejected(self):
        with self.assertRaises(ValueError):
            predict(self.model, "bad")


if __name__ == "__main__":
    unittest.main()
